import React from 'react'
import { Center, P, Strong } from 'react-pdf-levelup'


const Title = ({ text }: any) => {
    return (
        <Center style={{ fontSize: "10px" }}>
            <P style={{ fontSize: "10px", color: "#3d65fd" }}>
                <Strong>{text}</Strong>
            </P>
        </Center>
    );
}

export default Title;