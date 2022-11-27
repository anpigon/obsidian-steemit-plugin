import CustomTextComponent, { Props as CustomTextComponentProps } from './textinput_component';

export interface Props extends CustomTextComponentProps {
  label: string;
}

const CustomFormInputComponent = (
  containerEl: HTMLElement,
  { label, value, onChange, disabled, placeholder }: Props,
) => {
  return containerEl.createDiv({ cls: 'steem-plugin__container' }, container => {
    container.createSpan({
      text: `${label}: `,
      cls: 'steem-plugin__label',
    });
    const textComponent = CustomTextComponent(container, {
      value,
      onChange,
      disabled,
      placeholder,
    });
    container.appendChild(textComponent.inputEl);
  });
};

export default CustomFormInputComponent;
