import themes from './themes'

let themeElements = [];
themes.forEach((theme, i) => {
  const exists = document.getElementById(theme);
  if (exists) {
    themeElements.push(exists);
  } else {
    let link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `css/${theme}.css`;
    link.id = theme;
    document.head.appendChild(link);
    themeElements.push(link);
  }

})

export { themeElements }