//! Reads a photo file for `lanjut_set_photo`. The page cannot open a path on
//! the device, so this side reads the file and sends its bytes. The photo
//! never goes back to the assistant.

use base64::Engine;
use serde::Serialize;
use std::path::Path;

/// A larger file is not a portrait. The page makes it 256 px anyway.
const MAX_BYTES: u64 = 10 * 1024 * 1024;

#[derive(Debug, Serialize)]
pub struct PhotoImage {
    mime: &'static str,
    base64: String,
}

/// The image type from the first bytes of the file, not from its name.
fn image_type(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return Some("image/jpeg");
    }
    if bytes.starts_with(&[0x89, b'P', b'N', b'G']) {
        return Some("image/png");
    }
    if bytes.starts_with(b"GIF8") {
        return Some("image/gif");
    }
    if bytes.len() >= 12 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Some("image/webp");
    }
    None
}

pub async fn read_photo(path: &str) -> Result<PhotoImage, String> {
    let path = Path::new(path);
    if !path.is_absolute() {
        return Err("`path` must be an absolute path to an image file.".into());
    }
    let meta = tokio::fs::metadata(path)
        .await
        .map_err(|_| "Lanjut cannot open that file. Check the path.".to_string())?;
    if !meta.is_file() {
        return Err("`path` is not a file.".into());
    }
    if meta.len() > MAX_BYTES {
        return Err("The image is larger than 10 MB. Use a smaller file.".into());
    }
    let bytes = tokio::fs::read(path)
        .await
        .map_err(|_| "Lanjut cannot read that file.".to_string())?;
    let mime = image_type(&bytes)
        .ok_or_else(|| "That file is not a JPEG, PNG, WebP, or GIF image.".to_string())?;
    Ok(PhotoImage {
        mime,
        base64: base64::engine::general_purpose::STANDARD.encode(&bytes),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_the_image_types_by_their_bytes() {
        assert_eq!(image_type(&[0xFF, 0xD8, 0xFF, 0xE0]), Some("image/jpeg"));
        assert_eq!(image_type(b"\x89PNG\r\n"), Some("image/png"));
        assert_eq!(image_type(b"GIF89a"), Some("image/gif"));
        assert_eq!(image_type(b"RIFF\0\0\0\0WEBPVP8 "), Some("image/webp"));
        assert_eq!(image_type(b"%PDF-1.7"), None);
    }

    #[tokio::test]
    async fn refuses_a_relative_path() {
        assert!(read_photo("photo.jpg").await.is_err());
    }
}
