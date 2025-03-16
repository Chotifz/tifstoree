// import { toast } from 'sonner';

// export function useToast() {
//   return {
//     toast,
//     success: (message) => toast.success(message),
//     error: (message) => toast.error(message),
//     info: (message) => toast.info(message),
//     warning: (message) => toast.warning(message),
//     loading: (message, promise) => {
//       if (promise) {
//         return toast.promise(promise, {
//           loading: message,
//           success: (data) => data?.message || 'Success!',
//           error: (err) => err?.message || 'Something went wrong',
//         });
//       }
//       return toast.loading(message);
//     },
//     dismiss: toast.dismiss,
//   };
// }