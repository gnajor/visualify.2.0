export class Selector{
    static selectorInstances = [];

    static getCurrentSelectorbyId(id){
        const instance = Selector.selectorInstances.find(instance => instance.pageNumId === id);

        if(!instance) return null;
        return instance;
    }

    static getSelectorbyPageId(id){
        const instance = Selector.selectorInstances.find(instance => instance.pageId === id);

        if(!instance) return null;
        return instance;
    }

    static updateSelector(instance){
        Selector.selectorInstances.forEach(instance => instance.element.classList.remove("current"));
        instance.element.classList.add("current");
    }

    constructor(parent, pageId, pageNumId){
        const selector = document.createElement("select");
        selector.id = pageId + "-selector";
        parent.appendChild(selector);

        this.element = selector;
        this.pageId = pageId;
        this.pageNumId = pageNumId;
        Selector.selectorInstances.push(this);
    }

    renderItemsLongRange(){
        this.element.innerHTML = `<option value="short_term">Last 4 weeks</option>
                                  <option value="medium_term">Last 6 months</option>
                                  <option value="long_term">Last 12 months</option>`; 
    }

    renderItemsShortRange(){
        this.element.innerHTML = `<option value="short_term">Last 24 hours</option>
                                  <option value="medium_term">Last 48 hours</option>
                                  <option value="long_term">Last 7 days</option>`;
    }

    event(func){
        this.element.addEventListener("change", func);
    }
}