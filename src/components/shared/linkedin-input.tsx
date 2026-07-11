import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface LinkedinInputProps {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const LINKEDIN_PREFIX = "linkedin.com/in/";

/** Reduces a stored value or pasted URL down to the bare profile username. */
function toUsername(value: string): string {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/^linkedin\.com\/in\//i, "")
    .replace(/^\/+/, "");
}

/**
 * LinkedIn field with a fixed `linkedin.com/in/` prefix so the user only types
 * their username. The stored value keeps the full path (`linkedin.com/in/<user>`)
 * so the preview restores `https://` like any other URL; an empty username stores
 * an empty string rather than a bare, linkless prefix.
 */
export function LinkedinInput(props: LinkedinInputProps) {
  const display = toUsername(props.value);
  return (
    // Tighten the gap between the prefix and the input (default is pl-1.5).
    <InputGroup className="has-[>[data-align=inline-start]]:[&>input]:pl-0">
      <InputGroupAddon className="pr-0">
        <InputGroupText>{LINKEDIN_PREFIX}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={props.id}
        value={display}
        placeholder={props.placeholder}
        onChange={(event) => {
          const username = toUsername(event.target.value);
          props.onChange(username ? `${LINKEDIN_PREFIX}${username}` : "");
        }}
        onBlur={props.onBlur}
      />
    </InputGroup>
  );
}
