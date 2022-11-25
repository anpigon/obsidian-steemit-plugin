const CustomLoadingComponent = (contentEl: HTMLElement) => {
  return contentEl.createDiv({
    text: 'Waiting...',
    cls: 'steem-plugin__loading',
  });
};

export default CustomLoadingComponent;
