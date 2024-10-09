"use client";

import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  HomeOutlined,
  ReadOutlined,
  SettingOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  FileOutlined,
  BulbOutlined,
  UserOutlined,
  UploadOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { notification } from "antd";

interface IAppSideMenu {
  accessData: any;
  userId: string | null;
}


const AppSideMenu: React.FC<IAppSideMenu> = ({ accessData, userId }) => {
  const pathname = usePathname();
  const [selectedKey, setSelectedKey] = useState("1");
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const router = useRouter();
  const [accessLevel, setAccessLevel] = useState<string[]>([]);

  // Fetch user information from token
  useEffect(() => {
    const fetchUser = async () => {


      if (accessData) {
        const userData = await accessData;
        const access = userData.map((item: { accesslevels: any; }) => item.accesslevels);
        const updatedAccessLevel = [...access, "Dashboard", "Logout"];
        setAccessLevel(updatedAccessLevel);
      }
      else {
        console.error("Failed to fetch user:", accessData);
      }
    };

    fetchUser();




  }, []);



  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      setSelectedKey("2");
    } else if (pathname.startsWith("/recipe")) {
      setSelectedKey("12");
      setOpenKeys(["3"]);
    } else if (pathname.startsWith("/recipe")) {
      setSelectedKey("3");
      setOpenKeys(["3"]);
    } else if (pathname.startsWith("/upload-recipe")) {
      setSelectedKey("4");
      setOpenKeys(["3"]);
    } else if (pathname.startsWith("")) {
      setSelectedKey("5");
      setOpenKeys(["5"]);
    } else if (pathname.startsWith("/employees")) {
      setSelectedKey("10");
      setOpenKeys(["5"]);
    } else if (pathname.startsWith("/chemicals")) {
      setSelectedKey("15");
      setOpenKeys(["5"]);
    }
    else if (pathname.startsWith("/p-l")) {
      setSelectedKey("6");
    } else if (pathname.startsWith("/damco-data")) {
      setSelectedKey("7");
    } else if (pathname.startsWith("/nexus-data")) {
      setSelectedKey("8");
    } else if (pathname.startsWith("/privileges")) {
      setSelectedKey("9");
    } else if (pathname.startsWith("/logout")) {
      setSelectedKey("11");
    } else if (pathname === "/") {
      setSelectedKey("1");
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (response.ok) {
        notification.success({
          message: "Logged Out",
          description: "You have successfully logged out.",
          placement: "topRight",
        });
        router.push("/");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout request failed", error);
      notification.error({
        message: "Logout Failed",
        description: "There was a problem logging you out. Please try again.",
        placement: "topRight",
      });
    }
  };

  const menuItems = [

    {
      label: <Link href="/dashboard" className="text-black">Dashboard</Link>,
      key: "2",
      icon: <HomeOutlined />,
    },
    {
      label: (
        <span className="text-black">Recipe</span>
      ),
      children: [
        {
          label: (
            <Link href="/recipe" className="text-black">Recipe List</Link>
          ),
          key: "12",  // New key for Reciepe List
          icon: <ReadOutlined />,
        },
        {
          label: (
            <Link href="/upload-recipe" className="text-black">Upload Recipe</Link>
          ),
          key: "4",
          icon: <UploadOutlined />,
        },
      ],
      key: "3",
      icon: <ReadOutlined />,
    },
    {
      label: (
        <Link href="" className="text-black">Setup</Link>
      ),
      children: [
        {
          label: (
            <Link href="/employees" className="text-black">Employees</Link>
          ),
          key: "10",
          icon: <UserOutlined />,
        },
        {
          label: (
            <Link href="/chemicals" className="text-black">Chemicals</Link>
          ),
          key: "15",
          icon: <ExperimentOutlined />,
        },

      ],
      key: "5",
      icon: <BulbOutlined />,
    },
    {
      label: <Link href="/p-l">P&L</Link>,
      key: "6",
      icon: <BarChartOutlined />,
    },
    {
      label: <Link href="/damco-data">Damco Data</Link>,
      key: "7",
      icon: <DatabaseOutlined />,
    },
    {
      label: <Link href="/nexus-data">Nexus Data</Link>,
      key: "8",
      icon: <FileOutlined />,
    },

    {
      label: <a onClick={handleLogout}>Logout</a>,
      key: "11",
      icon: <SettingOutlined />,
    },
  ];

  const getFilteredMenuItems = (accessLevels: string[]) => {
    const hasAdminAccess = accessLevels.includes("Admin");

    const reconstructedMenuItems = menuItems.reduce((acc, item) => {
      if (hasAdminAccess) {
        acc.push(item);
        return acc;
      }

      if (item.children) {
        const accessibleChildren = item.children.filter(child =>
          accessLevels.includes(child.label.props.children)
        );

        if (accessibleChildren.length > 0) {
          acc.push({
            ...item,
            children: accessibleChildren,
          });
        }
      } else {
        if (accessLevels.includes(item.label.props.children)) {
          acc.push(item);
        }
      }

      return acc;
    }, [] as typeof menuItems);

    return reconstructedMenuItems;
  };

  const availableMenuItems = getFilteredMenuItems(accessLevel);


  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys); // Manage which submenu is open
  };

  return (
    <Menu
      mode="inline"
      items={availableMenuItems.map(item => ({
        ...item,
        style: item.key === selectedKey[0] ? { color: "#797FE7" } : {}
      }))}
      selectedKeys={[selectedKey]}
      openKeys={openKeys} // Handle open keys for submenus
      onOpenChange={onOpenChange} // Handle opening/closing of submenus
    />
  );
}

export default AppSideMenu;

