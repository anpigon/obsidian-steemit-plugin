import { TextComponent } from 'obsidian';

export interface Props {
  value: string;
  onChange?: (value: string) => unknown;
  disabled?: boolean;
  placeholder?: string;
}

const CustomTextComponent = (
  containerEl: HTMLElement,
  { value, onChange, disabled = false, placeholder }: Props,
) => {
  const textComponent = new TextComponent(containerEl);
  textComponent.inputEl.className = 'steem-plugin__w80';
  textComponent.setValue(value);
  textComponent.setDisabled(disabled);
  if (onChange) {
    textComponent.onChange(onChange);
  }
  if (placeholder) {
    textComponent.setPlaceholder(placeholder);
  }
  return textComponent;
};

export default CustomTextComponent;
