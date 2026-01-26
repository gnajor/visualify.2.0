let selectorElement = null;

export function renderSelector(parent) {
    const selector = document.createElement("select");
    selector.id = "time-range-selector";
    parent.appendChild(selector);

    selector.innerHTML = `<option value="short_term">Last 4 weeks</option>
                          <option value="medium_term">Last 6 months</option>
                          <option value="long_term">Last 12 months</option>`;

    selectorElement = selector;
}

export function onSelectorChange(callback) {
    selectorElement.addEventListener("change", callback);
}

export function getSelectorValue(){
    return selectorElement.value;
}