'use client';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ModelHomeListing, ModelListingService } from 'services/modelListing/modelListing.services';
import { HomePageMainContainer } from './Home.styled';
import HomeTopBanner from './homeBanner';
import HomeImageCard from './homeImageCards';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HOME_PAGE_SIZE } from 'constants/common.constants';
import { getQueryParam } from 'utils/genericFunction';
import { useAuthContext } from '../../../../context/AuthContext';
import { debounce } from 'lodash';
import { SearchFiltersTypes } from '../searchPage/searchFilters';
const HomeConnections = lazy(() => import('./HomeConnections'));
const BackdropProgress = lazy(() => import('components/UIComponents/BackDropProgress'));
const SearchFilters = lazy(() => import('../searchPage/searchFilters'));

const HomeContainer = () => {
  const { isFreeCreditAvailable, session } = useAuthContext();
  const token = session?.user ? JSON.parse((session.user as any)?.picture) : '';

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchFiltersRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);

  const [modelListing, setModelListing] = useState<ModelHomeListing[]>([]);
  const [total_rows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const getInitialFilters = () => ({
    fromAge: getQueryParam('fromAge') ? (getQueryParam('fromAge') as string) : '',
    toAge: getQueryParam('toAge') ? (getQueryParam('toAge') as string) : '',
    fromPrice: getQueryParam('fromPrice') ? (getQueryParam('fromPrice') as string) : '',
    toPrice: getQueryParam('toPrice') ? (getQueryParam('toPrice') as string) : '',
    language: getQueryParam('language') ? (getQueryParam('language') as string) : '',
    isOnline: getQueryParam('isOnline') ? (getQueryParam('isOnline') as string) : '',
    country: getQueryParam('country') ? (getQueryParam('country') as string) : '',
    sortOrder: getQueryParam('sortOrder') ? (getQueryParam('sortOrder') as string) : '',
    sortField: getQueryParam('sortField') ? (getQueryParam('sortField') as string) : '',
    gender: getQueryParam('gender') ? (getQueryParam('gender') as string) : '',
    page: Number(getQueryParam('page', 1)),
    pageSize: HOME_PAGE_SIZE,
    offset: (Number(searchParams.get('page') ?? 1) - 1) * HOME_PAGE_SIZE || 0,
    email: getQueryParam('email') ? getQueryParam('email') : ''
  });

  const [filters, setFilters] = useState(getInitialFilters());

  const handleChangeSearchFilter = useCallback(() => {
    const objParams: { [key: string]: string } = {};
    if (filters.fromAge) objParams.fromAge = filters.fromAge ? filters.fromAge.toString() : '';
    if (filters.toAge) objParams.toAge = filters.toAge ? filters.toAge.toString() : '';
    if (filters.page && filters.page > 1) objParams.page = filters.page ? filters.page.toString() : '1';
    if (filters.fromPrice) objParams.fromPrice = filters.fromPrice ? filters.fromPrice.toString() : '';
    if (filters.toPrice) objParams.toPrice = filters.toPrice ? filters.toPrice.toString() : '-';
    if (filters.language) objParams.language = filters.language ? filters.language.toString() : '';
    if (filters.isOnline) objParams.isOnline = filters.isOnline ? filters.isOnline.toString() : '';
    if (filters.country) objParams.country = filters.country ? filters.country.toString() : '';
    if (filters.sortOrder) objParams.sortOrder = filters.sortOrder ? filters.sortOrder.toString() : '';
    if (filters.sortField) objParams.sortField = filters.sortField ? filters.sortField.toString() : '';
    if (filters.email) objParams.email = filters.email ? filters.email.toString() : '';
    if (filters.gender) objParams.gender = filters.gender ? filters.gender.toString() : '';

    let filterCount = Object.keys(objParams).length;
    const queryString = new URLSearchParams(objParams).toString();

    if (pathname === '/' && filterCount === 0) {
      router.push('/');
    }
    if (pathname === '/' && filterCount === 1 && objParams.page) return;

    const isDetailsPage = pathname.startsWith('/details/');
    const isMultiple = [
      'language',
      'isOnline',
      'page',
      'fromPrice',
      'fromAge',
      'toPrice',
      'country',
      'sortOrder',
      'sortField',
      'gender'
    ].filter((x) => Object.keys(objParams).includes(x));
    if (filterCount === 0) {
      if (isDetailsPage) {
        const credit = searchParams.get('credit');
        if (!credit) router.push(pathname);
      } else {
        router.push('/');
      }
    } else {
      if (isMultiple.length) {
        if (isDetailsPage) {
          router.push(`${pathname}?${queryString}`);
        } else {
          router.push(`/?${queryString}`);
        }
      } else {
        if (isDetailsPage) {
          router.push(`${pathname}?${queryString}`);
        } else if (objParams.email) {
          return;
        } else {
          router.push(`/${pathname}?${queryString}`);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pathname, router]);

  const debounceHandleChangeSearchFilter = useCallback(
    debounce(() => {
      handleChangeSearchFilter();
    }, 300),
    [filters, pathname, router]
  );

  const handelFilterChange = async (values: SearchFiltersTypes) => {
    setIsLoading(true);
    const getModel = await ModelListingService.getModelListing(values, token.token);
    setModelListing(getModel?.model_details);
    setTotalRows(getModel?.aggregate?.total_rows);
    setIsLoading(false);
    if (initialRender.current === false) {
      if (searchFiltersRef.current) {
        if (scroll || searchParams?.toString()) {
          searchFiltersRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    if (token.token) {
      handelFilterChange(filters);
      setScroll(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.token]);

  const handleChangePage = useCallback(
    (value: number) => {
      if (value === 1) {
        const offset = (value - 1) * filters.pageSize;
        const newFilters = { ...filters, page: value, offset: offset };
        setFilters(newFilters);
        handelFilterChange(newFilters);
      }
      if (filters) {
        const offset = (value - 1) * filters.pageSize;
        const newFilters = { ...filters, page: value, offset: offset };
        setFilters(newFilters);
        handelFilterChange(newFilters);
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', value.toString());
        router.push(`/?${queryParams.toString()}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, router]
  );

  const handelFiltersFormSearch = (value: SearchFiltersTypes) => {
    const newFilters = { ...filters, ...value };
    setFilters(newFilters);
    setScroll(true);
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    }
    debounceHandleChangeSearchFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchParams]);
  useEffect(() => {
    setFilters(getInitialFilters());
    handelFilterChange(getInitialFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsUserInteracted(true);
      window.removeEventListener('scroll', handleScroll);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <>
      <HomePageMainContainer>
        <Suspense fallback={<div>Loading banner...</div>}>
          <HomeTopBanner isFreeCreditAvailable={isFreeCreditAvailable} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <BackdropProgress open={isLoading} />
          <SearchFilters isUserInteracted={isUserInteracted} handelFilterChange={handelFiltersFormSearch} ref={searchFiltersRef} />
        </Suspense>
        <Suspense fallback={<div>Loading cards...</div>}>
          <HomeImageCard
            modelListing={modelListing}
            isFavPage={false}
            token={token}
            filters={filters ?? ({} as SearchFiltersTypes)}
            totalRows={total_rows}
            handleChangePage={handleChangePage}
            isFreeCreditAvailable={isFreeCreditAvailable}
          />
        </Suspense>
        <Suspense fallback={<div>Loading connections...</div>}>
          <HomeConnections isFreeCreditAvailable={isFreeCreditAvailable} />
        </Suspense>
      </HomePageMainContainer>
    </>
  );
};

export default HomeContainer;
