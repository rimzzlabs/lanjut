import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface UrlInputProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * URL field with a fixed `https://` prefix so the user only types their domain.
 * The scheme is presentational (never part of the stored value); a leading
 * scheme in an existing value is stripped for display so it can't double up.
 */
export function UrlInput(props: UrlInputProps) {
  const display = props.value.replace(/^https?:\/\//i, "");
  return (
    // Tighten the gap between the prefix and the input (default is pl-1.5).
    <InputGroup className="has-[>[data-align=inline-start]]:[&>input]:pl-0">
      <InputGroupAddon className="pr-0">
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={props.id}
        value={display}
        placeholder={props.placeholder}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
      />
    </InputGroup>
  );
}
