import { headers } from "next/headers";
import AppSideMenu from "./AppSideMenu";
import { UseCurrentUrlServerSide } from "@/utils/useCurrentUrlServerSide";
import { redirect } from "next/navigation";

const AppSideServerCall = async () => {
    const userId = headers().get('x-user-id');   
    if (!userId) {
      redirect('/')
    }   
    const url = UseCurrentUrlServerSide();

    const userDataResponse = await fetch(`${url}/api/getAccessByUserId/${userId}`);
    const accessData = await userDataResponse.json();
    console.log("userData", accessData);
    return (
        <>
            <AppSideMenu accessData={accessData} userId={userId} />
        </>
    )
}

export default AppSideServerCall;

