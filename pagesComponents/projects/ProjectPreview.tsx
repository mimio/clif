import Link from 'next/link';
import Image from 'next/image';
import type { Project } from 'constants/projects';
import UserIcon from 'public/icons/user.svg';
import { PROJECTS } from 'constants/pages';
import { Detail2, Body, Detail3 } from 'components/text';

type ProjectPreviewProps = Pick<
  Project,
  'imgSrcSkinny' | 'id' | 'Icon' | 'product' | 'usersApproximate'
> & {
  index: number;
};

const ProjectPreview = ({
  imgSrcSkinny,
  index,
  id,
  Icon,
  product,
  usersApproximate,
}: ProjectPreviewProps) => (
  <Link
    as={`/${PROJECTS}/${id}`}
    href={`/${PROJECTS}/[projectId]`}
    className="group relative flex h-full w-[200px] flex-col items-center overflow-hidden rounded-[20px] border border-surface-2 select-none [-webkit-user-drag:none] transition-hue *:w-full *:transition-hue **:select-none hover:border-accent/30 max-desktop:w-[180px] max-tablet:w-[160px]"
  >
    <div className="grid h-40 grid-rows-[min-content_auto_min-content] items-center p-4 [grid-template-areas:'detail2_icon'_'body_body'_'detail3_detail3'] *:transition-hue">
      <Icon className="h-[18px] justify-self-end fill-fg-5 text-fg-5 [grid-area:icon] group-hover:fill-[#5d5d5d] group-hover:text-[#5d5d5d]" />
      <Detail2 className="[grid-area:detail2]">
        {index < 10 ? `0${index}` : index}
      </Detail2>
      <Body className="font-light [grid-area:body] group-hover:text-accent">
        {id}
      </Body>
      <Detail3 className="[grid-area:detail3]">{product}</Detail3>
    </div>
    {usersApproximate && (
      <div className="flex items-center justify-between bg-accent px-4 py-[6px]">
        <Detail3 className="font-bold text-on-accent">
          {usersApproximate} users
        </Detail3>
        <UserIcon className="w-3 text-on-accent group-hover:fill-[#5d5d5d] group-hover:text-[#5d5d5d]" />
      </div>
    )}
    <div className="relative grow overflow-hidden rounded-b-[20px] opacity-80 group-hover:opacity-100 [&_img]:pointer-events-none [&_img]:object-cover [&_img]:object-center">
      <Image
        src={imgSrcSkinny}
        alt={`${id} preview`}
        fill
        sizes="200px"
        draggable={false}
      />
    </div>
  </Link>
);

export default ProjectPreview;
