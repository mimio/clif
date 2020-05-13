const rgba = require('hex-to-rgba');

const yellow = '#FFE520';
const black = '#161616';
const offBlack = '#232323';

const colors = {
  background1: black,
  background2: '#202020',
  controlBackdrop: 'rgba(22,22,22,0.69)',
  text1: '#FFF',
  text1b: '#ebebeb',
  text1c: '#858585',
  text1d: '#474747',
  text1e: offBlack,
  text2: yellow,
  text3: black,
  border1: yellow,
  border2: rgba(yellow, 0.3),
  border3: offBlack,
  ctaBackground1: yellow,
  ctaBackground2: rgba(yellow, 0.3),
  ctaBackground3: rgba(yellow, 0.12),
  ctaBackground4: rgba(yellow, 0.6),
  scroll1: 'rgba(255, 229, 32, 0.3)',
  scroll2: 'rgba(255, 229, 32, 0.5)',
  scroll3: 'rgba(255, 229, 32, 0.8)',
};

module.exports = colors;
