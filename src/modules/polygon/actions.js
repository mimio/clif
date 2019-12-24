import fetchPolygon from 'api/fetchPolygon';

const base = 'polygon';
export const SHUFFLE_POLYGON = `${base}-shufflePolygon`;

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
];

export const shufflePolygon = () => ({
  type: SHUFFLE_POLYGON,
  promise: fetchPolygon(assetsIds[0]),
});
