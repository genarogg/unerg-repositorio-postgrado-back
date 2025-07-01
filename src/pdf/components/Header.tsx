import React from 'react'

import { Center, P, Img, BR } from "react-pdf-levelup";


const Header = ({ isFundesurg, isDace }: any) => {
    

    return (
        <>

            <Img src="https://genarogg.github.io/media/unerg/logo-unerg.png" style={{ width: "100px", position: "absolute", left: "30px" }}></Img>

            <Center style={{ fontSize: "10px" }}>
                <P style={{ marginBottom: "0", fontSize: "10px" }}>
                    REPÚBLICA BOLIVARIANA DE VENEZUELA
                </P>
                <P style={{ marginBottom: "0", fontSize: "10px" }}>
                    UNIVERSIDAD NACIONAL EXPERIMENTAL ROMULO GALLEGOS
                </P>
                <P style={{ fontSize: "10px" }}>
                    DIRECCIÓN DE ADMISIÓN Y CONTROL DE ESTUDIOS
                </P>
            </Center>

            

            <BR></BR>
            <BR></BR>
        </>
    );
}

export default Header;