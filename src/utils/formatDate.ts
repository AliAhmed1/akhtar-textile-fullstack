import { format } from 'date-fns';


export const formatDate = (dateString:Date) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
};