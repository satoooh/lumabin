import { useMemo, useRef } from 'react';

export const useAppDomRefs = () => {
  const appShellRef = useRef<HTMLDivElement | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const gallerySizeSliderRef = useRef<HTMLInputElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const profileAccessKeyInputRef = useRef<HTMLInputElement | null>(null);
  const profileBucketInputRef = useRef<HTMLInputElement | null>(null);
  const profileEndpointInputRef = useRef<HTMLInputElement | null>(null);
  const profileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuListRef = useRef<HTMLDivElement | null>(null);
  const profileNameInputRef = useRef<HTMLInputElement | null>(null);
  const profileRegionInputRef = useRef<HTMLInputElement | null>(null);
  const profileSecretKeyInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const uploadToastRef = useRef<HTMLElement | null>(null);

  const profileFormRefs = useMemo(() => ({
    profileAccessKeyInputRef,
    profileBucketInputRef,
    profileEndpointInputRef,
    profileNameInputRef,
    profileRegionInputRef,
    profileSecretKeyInputRef,
  }), [
    profileAccessKeyInputRef,
    profileBucketInputRef,
    profileEndpointInputRef,
    profileNameInputRef,
    profileRegionInputRef,
    profileSecretKeyInputRef,
  ]);

  return {
    appShellRef,
    galleryScrollRef,
    gallerySizeSliderRef,
    listContainerRef,
    profileFormRefs,
    profileMenuButtonRef,
    profileMenuListRef,
    searchInputRef,
    uploadToastRef,
  };
};
