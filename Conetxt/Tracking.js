import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// INTERNAL IMPORT
import tracking from "../Context/Tracking.json";

const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractABI = tracking.abi;

// FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
    // STATE VARIABLES
    const [currentUser, setCurrentUser] = useState("");
    const DappName = "Product Tracking Dapp";

    const createShipment = async (items) => {
        console.log(items);
        const { receiver, pickupTime, distance, price } = items;

        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const createItem = await contract.createShipment(
                receiver,
                new Date(pickupTime).getTime(),
                ethers.utils.parseUnits(price, "18"),
                ethers.utils.parseUnits(price, "18"),
                {
                    value: ethers.utils.parseUnits(price, "18"),
                }
            );
            
            await createItem.wait();
            console.log(createItem);
        } catch (error) {
            console.log("Something went wrong", error);
        }
    };

    const getAllShipment = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipments = await contract.getAllTransactions();
            
            const allShipments = shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
            }));
            
            return allShipments;
        } catch (error) {
            console.log("Error fetching shipments", error);
        }
    };

    return (
        <TrackingContext.Provider value={{ currentUser, DappName, createShipment, getAllShipment }}>
            {children}
        </TrackingContext.Provider>
    );
};
