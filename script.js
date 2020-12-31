const searchBar = document.getElementById('searchBar');
const form = document.getElementById('search-form');
const searchBtn = document.getElementById('search-btn');

// FUNCTIONS: 
function submitSearch(e) {
    e.preventDefault();

    deleteSearchResults();
    processSearch();

    searchBar.value = '';
    
    // document.body.remove();
}

async function processSearch() {
    clearStatsLine();
    const searchTerm = getSearchTerm();

    if(searchTerm === '') return;
    const resultArray = await getSearchResults(searchTerm);

    if(resultArray.length) {
        buildSearchResults(resultArray);
    } // build search results

    setStatsLine(resultArray.length);
}

function deleteSearchResults() {
    const parent = document.getElementById('searchResults');
    let child = parent.lastElementChild;
    while(child) {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }
}

function buildSearchResults(resultArray) {
    resultArray.forEach(result => {
        const resultItem = createResultItem(result);
        const resultContents = document.createElement("div");
        resultContents.classList.add("resultContents", "py-2", "px-3");
        if (result.image) {
        const resultImage = createResultImage(result);
        resultContents.append(resultImage);
        }
        const resultText = createResultText(result);
        resultContents.append(resultText);
        resultItem.append(resultContents);
        const searchResults = document.getElementById("searchResults");
        searchResults.append(resultItem);
    });
}

const createResultItem = (result) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("resultItem");
    const resultTitle = document.createElement("div");
    resultTitle.classList.add("resultTitle", "my-3", "px-3");
    const link = document.createElement("a");
    link.href = `https://en.wikipedia.org/?curid=${result.id}`;
    link.textContent = result.title;
    link.target = "_blank";
    resultTitle.append(link);
    resultItem.append(resultTitle);
    return resultItem;
};
  
const createResultImage = (result) => {
    const resultFlex = document.createElement("div");
    resultFlex.classList.add("resultFlex", "d-flex");
    const resultImage = document.createElement("div", "mb-3");
    resultImage.classList.add("resultImage", "img-fluid", "mb-3");
    const img = document.createElement("img");
    img.src = result.image;
    img.alt = result.title;
    resultImage.append(img);
    resultFlex.append(resultImage);
    return resultFlex;
};
  
const createResultText = (result) => {
    const resultText = document.createElement("div");
    resultText.classList.add("resultText");
    const resultDescription = document.createElement("p");
    resultDescription.classList.add("resultDescription", "mx-3");
    resultDescription.textContent = result.text;
    resultText.append(resultDescription);
    return resultText;
};

const setStatsLine = (numberOfResults) => {
    const statLine = document.getElementById("search-info");
    if (numberOfResults) {
      statLine.textContent = `Displaying ${numberOfResults} results.`;
    } else {
      statLine.textContent = "Sorry, no results.";
    }
};

function clearStatsLine() {
    document.getElementById("search-info").textContent = "";
}

function getSearchTerm () {
    const rawSearchTerm = document.getElementById('searchBar').value.trim();
    const regex = /[ ]{2,}/gi;
    const searchTerm = rawSearchTerm.replaceAll(regex, ' ');
    return searchTerm;
}

async function getSearchResults(searchTerm) {
    const wikiSearchString = getWikiSearchString(searchTerm);
    const wikiSearchResults = await requestData(wikiSearchString);
    let resultArray = [];
    
    if(wikiSearchResults.hasOwnProperty("query")) {
        resultArray = processWikiResults(wikiSearchResults.query.pages);
    }
    
    return resultArray;
}

function processWikiResults(results) {
    const resultArray = [];
    Object.keys(results).forEach(key => {
        const id = key;
        const title = results[key].title;
        const text = results[key].extract;
        const image = results[key].hasOwnProperty('thumbnail') ? results[key].thumbnail.source : null;

        const item = {
            id: id,
            title: title,
            image: image,
            text: text
        };

        resultArray.push(item);
    });
    console.log(resultArray);
    return resultArray;
}

async function requestData(searchString) {
    try {
        const response = await fetch(searchString);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

function getWikiSearchString(searchTerm) {
    const maxChars = getMaxChars();
    const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;

    const searchString = encodeURI(rawSearchString);

    return searchString;
}

function getMaxChars() {
    const width = window.innerWidth;
    let maxChars = 400;
    
    return maxChars;
}

// EVENT LISTENERS
form.addEventListener('submit', submitSearch);
searchBtn.addEventListener('click', submitSearch);

