export class Router {
    static init(defaultComponent, baseUri) {
        Router.baseUri = baseUri;
        // set up routing
        document.querySelectorAll("nav a").forEach(a => {
            const link = a;
            link.addEventListener("click", Router.handleLinkClick);
        });
        let componentName = location.href.substring(location.href.lastIndexOf("/") + 1);
        componentName = componentName ? componentName + "-page" : defaultComponent;
        document.querySelector("main").appendChild(document.createElement(componentName));
    }
}
Router.handleLinkClick = (e) => {
    const link = e.target;
    e.preventDefault();
    history.pushState(null, null, Router.baseUri + link.pathname);
    const component = document.createElement(link.href.substring(link.href.lastIndexOf("/") + 1) + "-page");
    document.querySelector("main").innerHTML = "";
    document.querySelector("main").appendChild(component);
    window.scrollTo({ top: 0 });
};
//# sourceMappingURL=router.js.map