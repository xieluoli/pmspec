document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-review-tabs]').forEach((tabGroup) => {
    const section = tabGroup.closest('.proto-stack');
    const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
    const panels = [...section.querySelectorAll('[data-review-panel]')];
    function selectTab(selectedTab) {
      tabs.forEach((tab) => {
        const selected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.reviewPanel !== selectedTab.dataset.reviewState;
      });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        let nextIndex;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        selectTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
    selectTab(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
});
