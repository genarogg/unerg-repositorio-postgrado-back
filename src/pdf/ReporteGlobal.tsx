import React from "react";
import {
    LayoutPDF,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Center,
    P,
    Strong,
    Right,
    Span,
    Col6,
    Container,
    Row,
} from "react-pdf-levelup";

import Header from "./components/Header";
import Title from "./components/Title";

const ReporteInvestigacion = ({ data }: any) => {
    const { resumen, trabajos_por_linea, trabajos_por_periodo, trabajos_por_linea_y_periodo } = data;

    return (
        <LayoutPDF size="A4" padding={20} showPageNumbers={true}>
            <Header isDace={true}></Header>

            <Title text="REPORTE DE TRABAJOS DE INVESTIGACIÓN"></Title>

            {/* Resumen General */}
            <Container style={{ marginBottom: 20 }}>
                <Row>
                    <Col6>
                        <P><Strong>Total de Trabajos:</Strong> {resumen.total_trabajos}</P>
                        <P><Strong>Líneas Consultadas:</Strong> {resumen.lineas_consultadas}</P>
                    </Col6>
                    <Col6>
                        <P><Strong>Períodos Consultados:</Strong> {resumen.periodos_consultados}</P>
                        <P><Strong>Fecha de Generación:</Strong> {new Date(resumen.fecha_generacion).toLocaleDateString()}</P>
                    </Col6>
                </Row>
            </Container>

            {/* Tabla de Trabajos por Línea de Investigación */}
            <Title text="TRABAJOS POR LÍNEA DE INVESTIGACIÓN" style={{ fontSize: 14, marginTop: 30 }}></Title>

            <Table style={{ marginBottom: 30 }}>
                <Thead>
                    <Tr>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "70%" }}>
                            Línea de Investigación
                        </Th>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "30%" }}>
                            Cantidad de Trabajos
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {trabajos_por_linea.map((linea: any) => (
                        <Tr key={linea.lineaDeInvestigacionId}>
                            <Td style={{ width: "70%" }}>
                                {linea.nombreLinea}
                            </Td>
                            <Td style={{ width: "30%", textAlign: "center" }}>
                                {linea.cantidadTrabajos}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Tabla de Trabajos por Período */}
            <Title text="TRABAJOS POR PERÍODO ACADÉMICO" style={{ fontSize: 14, marginTop: 30 }}></Title>

            <Table style={{ marginBottom: 30 }}>
                <Thead>
                    <Tr>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "50%" }}>
                            Período Académico
                        </Th>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "50%" }}>
                            Cantidad de Trabajos
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {trabajos_por_periodo.map((periodo: any) => (
                        <Tr key={periodo.periodoAcademicoId}>
                            <Td style={{ width: "50%" }}>
                                {periodo.periodo}
                            </Td>
                            <Td style={{ width: "50%", textAlign: "center" }}>
                                {periodo.cantidadTrabajos}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Tabla Detallada por Línea y Período */}
            <Title text="DETALLE POR LÍNEA Y PERÍODO" style={{ fontSize: 14, marginTop: 30 }}></Title>

            <Table>
                <Thead>
                    <Tr>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "50%" }}>
                            Línea de Investigación
                        </Th>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "20%" }}>
                            Período
                        </Th>
                        <Th style={{ backgroundColor: "#b6d4ff", width: "30%" }}>
                            Trabajos
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {trabajos_por_linea_y_periodo.map((item: any, index: any) => (
                        <Tr key={`${item.lineaDeInvestigacionId}-${item.periodoAcademicoId}`}>
                            <Td style={{ width: "50%" }}>
                                {item.nombreLinea.length > 35
                                    ? `${item.nombreLinea.slice(0, 35)}...`
                                    : item.nombreLinea}
                            </Td>
                            <Td style={{ width: "20%", textAlign: "center" }}>
                                {item.periodo}
                            </Td>
                            <Td style={{ width: "30%", textAlign: "center" }}>
                                {item.cantidadTrabajos}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Pie de página con filtros aplicados */}
            <Container style={{ marginTop: 30, fontSize: 10 }}>
                <P><Strong>Filtros Aplicados:</Strong></P>
                <P>Líneas de Investigación: {data.filtros_aplicados.lineas_investigacion.join(', ')}</P>
                <P>Períodos Académicos: {data.filtros_aplicados.periodos_academicos.join(', ')}</P>
            </Container>
        </LayoutPDF>
    );
};

export default ReporteInvestigacion;