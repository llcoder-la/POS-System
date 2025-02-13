import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Title, Paragraph, Button } from "react-native-paper";
import { Transaction } from "../types";
import { fetchTransactions, refundTransaction } from "../api/transactions";
import { useUser } from "../contexts/UserContext";

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { userId } = useUser();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const transactionsData = await fetchTransactions(userId);
            setTransactions(transactionsData);
        } catch (error) {
            console.error("Error loading transactions:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    const handleRefund = async (transactionId: number) => {
        try {
            await refundTransaction(userId, transactionId);
            await loadTransactions(); // Refresh the list after refund
        } catch (error) {
            console.error("Error refunding transaction:", error);
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>Transaction #{item.id}</Title>
                <Paragraph>
                    Date:{" "}
                    {new Date(item.dateOfTransaction).toLocaleDateString()}
                </Paragraph>
                <Paragraph>Total: PHP{item.totalPrice}</Paragraph>
                <Paragraph>Status: {item.status}</Paragraph>
            </Card.Content>
            {item.status === "completed" && (
                <Card.Actions>
                    <Button
                        mode="contained"
                        onPress={() => handleRefund(item.id)}
                        style={styles.refundButton}
                    >
                        Refund
                    </Button>
                </Card.Actions>
            )}
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#007bff"
                        title="Refreshing..."
                        titleColor="#007bff"
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    card: {
        margin: 8,
    },
    refundButton: {
        backgroundColor: "#dc3545",
    },
});
