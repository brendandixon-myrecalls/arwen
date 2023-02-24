import Waiting from '../Utilities/Waiting';

const Loading = (props) => {
    if (props.error) {
        window.location.reload(true);
        return null;
    }

    else if (props.pastDelay) {
        return (<Waiting />);
    }

    else {
        return null;
    }
}

export default Loading;
