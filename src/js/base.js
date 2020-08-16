export const elements = {
    searchResultWrapper: document.querySelector('.main__content-wrapper'),
    buttonsWrapper: document.querySelector('.result__pages'),
    searchInput: document.querySelector('#searchInp'),
    searchButton: document.querySelector('#searchBtn'),
}

export const elementStrings = {
    loader: 'loader_wrapper'
};

export const renderLoader = parent => {
    const loader =
        `
        <div class="${elementStrings.loader}"><div class="loader__inner-wrapper"><div class="lds-roller loader">
        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div>
        `;
    parent.insertAdjacentHTML('beforebegin', loader);
}

export const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);
    if (loader) loader.parentElement.removeChild(loader);
}


