import './scss/index.scss'
import axios from "axios"
import { elements, renderLoader, clearLoader } from '@/js/base'
import key from "@/js/utils"


///////////////////////////////////////////////////////////////////////////////////////////////////////////SEARCH MODEL
class Search {
    constructor(query, page ) {
        this.query = query;
        this.page = page
    }

    async getResults() {
        try {
            const res = await axios.get(`http://www.omdbapi.com/?apikey=${key.key}&page=${this.page}&plot=full&s=${this.query}`)
            this.results = res.data;
        } catch (error) {
            alert(`Error from Search model, ${error}`)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////SEARCH VIEW

const searchResultWrapper = elements.searchResultWrapper

const renderMoviePrev = movie => {
    const markup =
        `
        <article class="item" style="background-image: url('${movie.Poster}');">
        <a href="https://www.google.com/search?sxsrf=ALeKk02j-UD74s20t1D1Wv6VZJpl4QWwWw%3A1597511050830&ei=ihU4X96lMuarrgS1nbGwBw&q=
${movie.Title}+${movie.Year}+movie&oq=${movie.Title}+${movie.Year}+movie" target="_blank">
           <h3 class="item__header">${(movie.Title).toUpperCase()}</h3>
         </a>  
            <div class="item__info-wrapper">
                <p class="item__info-type">${movie.Type}</p>
                <p class="item__info-year">${movie.Year}</p>
            </div>
        </article>
    `;
    searchResultWrapper.insertAdjacentHTML('beforeend', markup)
}

const createButton = (page, type) =>
    `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1} >
       <span>${type === 'prev' ? '&lt; Prev' : 'Next &gt;'}</span>
    </button>
    `
;

const buttonsWrapper = document.querySelector('.result__pages');//

const renderPagination = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let fromRes = page * 10;
    let toRes = fromRes + 10;

    let button;
    let snippet;

    if (page === 1 && pages > 1) {
        button = createButton(page, 'next')
        fromRes = page
        toRes = fromRes + resPerPage;
    } else if (page < pages) {
        button =
            `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `
        fromRes = (page - 1) * 10 + 1;
        toRes = fromRes + resPerPage - 1;

    } else if (page === pages && pages > 1) {
        button = createButton(page, 'prev')
        fromRes = (page - 1) * 10 + 1;
        toRes = numResults;
    }

    let curResCounts = `${fromRes} - ${toRes}`;

    snippet =
        `
        <div class="pages__info">
            <p class="results__overview"><span class="results__per-page">items per page 10</span>
           <span class="results__current">${curResCounts}</span> of <span class="results__total">${numResults}</span></p>
            <div class="pages__wrapper">
            ${button}
            </div>
         </div>
        `;

   buttonsWrapper.insertAdjacentHTML('afterbegin', snippet);
}

const renderResults = (movies, page) => {
    let movies1 = movies.Search;
    if(movies1){
        movies1.forEach(renderMoviePrev);
        renderPagination(page, movies.totalResults, 10)
    } else {
        const markup = '<p style="font-size: 2rem; color: red">Ничего не найдено!</p>';
        searchResultWrapper.insertAdjacentHTML('beforeend', markup)
    }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////SEARCH CONTROLLER

const state = {}
const searchInput = document.querySelector('#searchInp');//
searchInput.focus();

const controlSearch = async () => {
    //1) Get query from view
    let query = searchInput.value;

    function setDataToLocalStarage (item) {
        localStorage.setItem('lastQuery', JSON.stringify(item))
    }

    setDataToLocalStarage(query);

    if (query) {
        //2) Create new Search obj
        state.search = new Search(query, 1)

        //3) Prepare UI for results
        searchInput.value = '';
        searchResultWrapper.innerHTML = '';
        buttonsWrapper.innerHTML = '';
        //loader
        renderLoader(elements.searchResultWrapper)


        try {
            //4) Search for movies
            await state.search.getResults();
            //stop loader
            clearLoader()
            renderResults(state.search.results, 1);
        } catch (error) {
            console.log(`Error from controller: ${error}`)
            //stop loader
            clearLoader()
        }
    }
}

const searchButton = document.querySelector('#searchBtn');//
searchButton.addEventListener('click', e => {
    e.preventDefault();
    controlSearch();
})
searchButton.addEventListener('keyup', e => {
    if(e.code === 'Enter') {
        e.preventDefault();
        controlSearch();
    }
})
searchInput.addEventListener('keyup', e => {
    if(e.code === 'Enter') {
        e.preventDefault();
        controlSearch();
    }
})

buttonsWrapper.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchResultWrapper.innerHTML = '';
        buttonsWrapper.innerHTML = '';

        const controlSearch = async () => {
            //1) Get query from local storage
            let query;
            async function getDataFromLocalStorage () {
                const storage = await JSON.parse(localStorage.getItem('lastQuery'));
                if (storage) {
                    return query = storage
                }
            }

            query = await getDataFromLocalStorage();

            if (query) {
                //2) Create new Search obj
                state.search = new Search(query, goToPage)

                //3) Prepare UI for results
                searchResultWrapper.innerHTML = '';
                buttonsWrapper.innerHTML = '';
                //loader
                renderLoader(elements.searchResultWrapper)

                try {
                    //4) Search for movies
                    await state.search.getResults();
                    //stop loader
                    clearLoader()


                    await renderResults(state.search.results, goToPage);
                } catch (error) {
                    alert(`Error from controller: ${error}`)
                    //stop loader
                    clearLoader()
                }
            }
        }
        controlSearch();
    }
})



