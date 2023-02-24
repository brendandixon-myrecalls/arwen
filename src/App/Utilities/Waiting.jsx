import Progress from '../Utilities/Progress';

const Waiting = (props) => {
    return (<div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
    }}>
        <div
            style={{
                color: '#FFFFFF',
                fontSize: '2em',
                paddingBottom: '1em',
            }}
        >
            Just a moment please&hellip;
        </div>
        <Progress />
    </div>);
}

export default Waiting;
