import { Inter } from "next/font/google";
import "../../../src/app/globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Layout } from "antd";
import AppHeader from "@/components/AppHeader/AppHeader";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import AppSideServerCall from "@/components/AppSideMenu/AppSideServerCall";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Akhtar Textile App",
//   description: "Akhtar Textile App",
// };


export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>

      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <Layout>
            <AppHeader />
            <Layout hasSider>
              <Sider
                theme="light"
                style={{
                  left: 0,
                  borderRight: "1px solid #f1f1f1",
                  height: "calc(100vh - 64px)",
                }}
              >
                <AppSideServerCall />
              </Sider>
              <Layout>
                <Content
                  style={{ padding: "25px", minHeight: "calc(100vh - 64px)" }}
                >
                  {" "}
                  {children}
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </AntdRegistry>
      </body>
    </html>
  );
}
