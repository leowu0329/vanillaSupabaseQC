// js/app.js
document.addEventListener("DOMContentLoaded", () => {
    const model = new IPQCModel();
    const view = new IPQCView();
    window.controller = new IPQCController(model, view);
    window.controller.init();
});