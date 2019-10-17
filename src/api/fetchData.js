const url = 'https://mountaingames.com/wp-json/maps-api/locations';

export const fetchData = () => fetch(url).then(res => res.json());
