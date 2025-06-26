import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";

const HelloWorldTemplate = ({ data }: any) => (
  <Document>
    <Page>
      <Text>{data.message}</Text>
      <View>
        {data.items && data.items.map((item: any, index: number) => (
          <Text key={index}>{item}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default HelloWorldTemplate;