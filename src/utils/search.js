import {
  Search,
  StemmingTokenizer,
  SimpleTokenizer,
} from 'js-search';
import stemmer from 'stemmer';

const searchKeys = ['Name', 'Category', 'ShortDescription'];

let searchEngine;
export const createSearchEngine = data => {
  searchEngine = new Search('id');
  searchEngine.tokenizer = new StemmingTokenizer(
    stemmer,
    new SimpleTokenizer(),
  );
  searchKeys.forEach(key => searchEngine.addIndex(key));

  searchEngine.addDocuments(Object.values(data));

  return searchEngine;
};

export const getSearchEngine = () => searchEngine;

const capitalize = string =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const createSearchPlaceholder = () =>
  capitalize(
    `Search ${searchKeys.join(', ')}...`
      .replace('-', ' ')
      .toLowerCase(),
  );
