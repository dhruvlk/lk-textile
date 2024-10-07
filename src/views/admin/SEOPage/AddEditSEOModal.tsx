import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Formik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { TokenIdType } from 'views/protectedModelViews/verification';
import { getUserDataClient } from 'utils/getSessionData';
import { ErrorMessage } from 'constants/common.constants';
import { PaginationType } from './SEOContainer';
import { AdminSEOProfileData, AdminSEOProfileParam, adminSEOServices } from 'services/adminSEOProfilePlan/adminSEOProfilePlan.services';

const AddEditSEOModal = ({
  open,
  onClose,
  selectedSEO,
  handleChangeFilter,
  filters
}: {
  open: boolean;
  onClose: () => void;
  selectedSEO: AdminSEOProfileData | null;
  handleChangeFilter: (value: PaginationType) => void;
  filters: PaginationType;
}) => {
  const validationSchema = yup.object({
    model_name: yup.string().required('Model name is required'),
    title: yup.string().required('Title is required'),
    keywords: yup.string().required('Keywords is required'),
    description: yup.string().required('Description is required')
  });

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<TokenIdType>({ id: 0, token: '' });

  const handleFormSubmit = async (values: AdminSEOProfileParam) => {
    setIsLoading(true);
    const res = await adminSEOServices.adminAddSEOProfile(values, token.token);
    if (res) {
      if (res.code === 200) {
        toast.success('SEO added successfully');
        onClose();
        handleChangeFilter({
          page: filters.page,
          offset: filters.offset,
          page_size: filters.page_size,
          sort_field: filters.sort_field,
          sort_order: filters.sort_order,
          search_field: filters.search_field,
          is_seo: filters.is_seo
        });
      } else {
        toast.error(ErrorMessage);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const userToken = async () => {
      const data = await getUserDataClient();
      setToken({ id: data.id, token: data.token });
    };

    userToken();
  }, []);

  const handleFormEdit = async (values: AdminSEOProfileParam) => {
    setIsLoading(true);
    const res = await adminSEOServices.adminUpdateSEOProfile(values, Number(selectedSEO?.seo_id), token.token);
    if (res) {
      if (res.code === 200) {
        toast.success('SEO edit successfully');
        onClose();
        handleChangeFilter({
          page: filters.page,
          offset: filters.offset,
          page_size: filters.page_size,
          sort_field: filters.sort_field,
          sort_order: filters.sort_order,
          search_field: filters.search_field,
          is_seo: filters.is_seo
        });
      } else {
        toast.error(ErrorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        id="responsive-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle">
          {selectedSEO?.title && selectedSEO?.keywords && selectedSEO?.description ? 'Edit' : 'Add'} SEO
        </Typography>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Formik
        initialValues={{
          model_id: selectedSEO?.model_id || 0,
          model_name: selectedSEO?.model_name || '',
          title: selectedSEO?.title || '',
          keywords: selectedSEO?.keywords || '',
          description: selectedSEO?.description || '',
          user_name: selectedSEO?.user_name || ''
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          if (selectedSEO?.title && selectedSEO?.keywords && selectedSEO?.description) await handleFormEdit(values);
          else await handleFormSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleChange, setFieldValue, handleBlur, handleSubmit }) => {
          return (
            <Box component="form" onSubmit={handleSubmit}>
              <DialogContent dividers>
                <Stack
                  spacing={2}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      marginLeft: 0
                    }
                  }}
                >
                  <TextField
                    name="model_name"
                    label="Name"
                    value={values.model_name}
                    error={Boolean(touched.model_name && errors.model_name)}
                    helperText={touched.model_name && errors.model_name ? errors.model_name : ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <TextField
                    name="title"
                    label="Title"
                    value={values.title}
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title ? errors.title : ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <TextField
                    name="keywords"
                    label="Keywords"
                    value={values.keywords}
                    error={Boolean(touched.keywords && errors.keywords)}
                    helperText={touched.keywords && errors.keywords ? errors.keywords : ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <TextField
                    name="description"
                    label="Description"
                    value={values.description}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description ? errors.description : ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    minRows={4}
                    maxRows={8}
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" size="large" onClick={onClose}>
                  Cancel
                </Button>
                <LoadingButton loading={isLoading} size="large" type="submit" variant="contained" color="primary">
                  Publish
                </LoadingButton>
              </DialogActions>
            </Box>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default AddEditSEOModal;
