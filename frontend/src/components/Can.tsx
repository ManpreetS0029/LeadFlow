import { useAuth } from "../context/AuthContext";

const Can = ({ permission, children }) => {
    const {hasPermission} = useAuth();

    if(!hasPermission)
    {
        return null;
    }

    return children;
};

export default Can;