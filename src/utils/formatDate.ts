import { format } from 'date-fns';


export const formatDate = (dateString:Date) => {
  return format(new Date(dateString), 'MM/dd/yyyy HH:mm:ss');
};