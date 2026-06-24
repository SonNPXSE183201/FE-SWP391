import { useParams } from 'react-router-dom';
import { PageCanvasFeature } from '../../features/canvas';

export const PageCanvasPage = () => {
  const { chapterId } = useParams();
  return <PageCanvasFeature chapterId={chapterId ?? '1'} />;
};
