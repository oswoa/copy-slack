import { Backdrop, CircularProgress } from "@mui/material";

const Loading = () => {
    return (
        <Backdrop open={true}>
            <CircularProgress color="info" size={120} />
        </Backdrop>
    );
};

export default Loading;
