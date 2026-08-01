document.querySelectorAll('[data-current-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

document.querySelectorAll('.publication-section').forEach((section) => {
  let nextNumber = 1;

  section.querySelectorAll('ol.publication-list').forEach((list) => {
    list.start = nextNumber;
    nextNumber += list.querySelectorAll(':scope > li.publication').length;
  });
});
