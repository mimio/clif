import fetchPolygon from 'api/fetchPolygon';

const base = 'polygon';
export const SHUFFLE_POLYGON = `${base}-shufflePolygon`;

let index = 0;
const assetsIds = [
  'ccQg0nHGSA9',
  '2mq7ScdwvdZ',
  'd6Xadlg51aC',
  '58zA8yry4qr',
  'bliLXiDJNal',
  'c406LNgto0n',
  'a02W3MqEt0P',
  'c9fdvmLhrsT',
  '8nMC2GZProF',
].sort(() => Math.random() - 0.5);

export const shufflePolygon = () => dispatch => {
  dispatch({
    type: SHUFFLE_POLYGON,
    promise: fetchPolygon(assetsIds[index]),
  });
  index = index === assetsIds.length - 1 ? 0 : index + 1;
};
