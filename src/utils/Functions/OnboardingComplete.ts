import { UserInterface } from "../../types/UserInterface";

export const checkOnbOardingComplete=(user:UserInterface)=>{
 for (const obj of user.onBoarding) {
    //@ts-ignore
    for (const field of obj?.pendingFields) {
      if (field in obj && obj[field] !== '') {
        return false; // Found a non-empty pending field
      }
    }
  }
  return true; 
}