'use client';
import React, { useEffect, useState } from 'react';
import "../../app/globals.css";
// import "./";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { message, Button } from 'antd';
import { LockOutlined, UnlockOutlined, UserOutlined } from '@ant-design/icons';
import useCheckFetchOnce from '@/utils/useCheckFetchOnce';
import Cookies from 'js-cookie';

interface LoginProps {
  username: string;
  password: string;
}

const defaultValues: LoginProps = {
  username: "",
  password: "",
};

interface ILoginForm {
  userId: string | null
}

const LoginForm: React.FC<ILoginForm> = ({ userId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>({
    defaultValues,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkFetchOnce = useCheckFetchOnce();
  const cache = new Map<string, { userId?: string; isUnauthorized?: boolean }>();


  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (values: LoginProps) => {
    try {
      setLoading(true);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || 'Failed to login');
        message.error(data.message || 'Login failed. Please try again.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
      setLoading(false);

    } catch (error) {
      console.error('Login failed', error);
      setLoginError('Something went wrong. Please try again.');
    }

  };

  useEffect(() => {
    const authToken = Cookies?.get('token');
    if (checkFetchOnce()) {
      if (authToken) {
        fetch("/api/logout", { method: "POST" });
      }
    }
  }, [])


  return (
    <>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>

        {/* Main Content Section */}
        <div className="absolute w-[70%] bg-[#EBEFFF] h-screen">
          <div className="relative container mx-auto">
            <div className="relative md:pt-[30%] pl-[25%] lg:pt-[23%]">
              <div className="relative color-[#1A1A1A] md:ml-[17.5%] font-inter md:text-[2vh] font-[700] md:text-left lg:text-[3.5vh] ">
                Welcome Back!
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="form">
                <div className="relative mt-[5%] text-[2vh] font-[400]">
                  <div>
                    <label htmlFor="username">
                      Username:
                    </label>
                    <div>
                      <input
                        {...register("username")}
                        type="text"
                        id="username"
                        className="px-[10px] w-[55%] border border-[#656ED3] rounded-lg md:text-sm lg:text-lg"
                      />
                      <UserOutlined className="ml-2 text-[#656ED3] text-xl" />
                    </div>
                  </div>
                  <div className="relative text-[2vh] font-[400]">
                    <label htmlFor="password">
                      Password:
                    </label>
                    <div className="flex items-center">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="px-[10px] w-[55%] border border-[#656ED3] md:rounded-lg md:text-sm lg:text-lg "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-[#656ED3] text-xl"
                      >
                        {showPassword ? <UnlockOutlined /> : <LockOutlined />}
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading} // Loader when submitting
                  // disabled={loading} // Disable button while loading
                  // className="w-[55%] bg-[#656ED3] rounded-lg text-white mt-[2.5%] text-sm"
                  className='w-[55%] bg-[#656ED3] rounded-lg text-white mt-[2.5%] text-sm hover:bg-[#4a50a8] customButton'
                >
                  Login
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[30%] bg-[#656ED3] h-screen">
          <img src='img/login-pc.png' className='relative top-[25%] left-[-40%]' style={{ width: '100%', height: 'auto' }} ></img>
        </div>

      </div>
    </>

  );
};

export default LoginForm;
