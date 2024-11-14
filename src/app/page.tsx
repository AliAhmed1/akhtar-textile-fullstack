import LoginForm from "@/components/login/LoginForm";
import { headers } from "next/headers";
import { UseCurrentUrlServerSide } from "@/utils/useCurrentUrlServerSide";


const Login = async () => {
  const userId = headers().get('x-user-id'); 
  return <LoginForm userId={userId} />
}

export default Login;