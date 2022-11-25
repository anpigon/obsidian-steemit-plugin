import { DropdownComponent } from 'obsidian';

type Props = {
  options: Record<string, string>;
  value: string;
  onChange: (value: string) => unknown;
};

const CustomDropdownComponent = (containerEl: HTMLElement, { options, value, onChange }: Props) => {
  const categoryComponent = new DropdownComponent(containerEl);
  categoryComponent.addOptions(options);
  categoryComponent.setValue(value);
  categoryComponent.onChange(onChange);
  return categoryComponent;
};

export default CustomDropdownComponent;
