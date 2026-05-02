function bindAdminActions(options) {
    options.saveButton.addEventListener("click", options.onSave);
    options.publishButton.addEventListener("click", options.onPublish);
    if (options.reloadButton) {
        options.reloadButton.addEventListener("click", options.onReload);
    }
    options.resetButton.addEventListener("click", options.onReset);
    if (options.historyRefreshButton) {
        options.historyRefreshButton.addEventListener("click", options.onHistoryRefresh);
    }
}

function setActionButtonsDisabled(buttons, disabled) {
    buttons.forEach(function (button) {
        if (button) {
            button.disabled = disabled;
        }
    });
}

export { bindAdminActions, setActionButtonsDisabled };
