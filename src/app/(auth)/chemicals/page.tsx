import Chemicals from "@/components/Chemicals/Chemicals";
import { UseCurrentUrlServerSide } from "@/utils/useCurrentUrlServerSide";

const chemicals: React.FC = async () => {
const url = UseCurrentUrlServerSide();


  const fetchChemicals = async () => {
    try {
      
      const response = await fetch(`${url}/api/getAllChemicals`,{
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // console.log("data",data)
      return data.chemicals;
    } catch (error) {
      console.error('Failed to fetch chemicals:', error);
    }
  };
  
  const chemicalData = await  fetchChemicals();

  return (
    <div>
     <Chemicals  chemicalData={chemicalData}/>
    </div>
  );
};

export default chemicals;