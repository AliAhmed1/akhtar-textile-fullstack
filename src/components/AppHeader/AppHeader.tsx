import { Header } from "antd/es/layout/layout";
import React from "react";
import { MenuOutlined, RadarChartOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import Link from "next/link";

function AppHeader() {
  return (
    <Header className="!bg-white border-b border-[#f1f1f1] flex items-center  top-0 z-10">

      <div className="flex justify-between w-[100%]">
      <div className="flex">
      <Link href="/">
        <img
          src="img/hail1.png"
          alt="Akhtar Texttile"
          // style={{width:"100px;"}}  
          style={{
            width: "130px", 
            // backgroundColor: "#595959",
            borderRadius:"3px", 
            // padding:"2px", 
          }}
        />
        </Link>
        
      </div>
      <div className="flex items-center gap-2">
        <Avatar size={45} style={{ backgroundColor: "#b191bf73" }} icon={<UserOutlined color="#595959"/>}/>
      </div>
      </div>
    </Header>

  );
}

export default AppHeader;