const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar,
    TransferTransaction,
} = require('@hashgraph/sdk');
require('dotenv').config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (myAccountId == null || myPrivateKey == null) {
        throw new Error(
            'Environment variables myAccountId and myPrivateKey must be present'
        );
    }
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = await PrivateKey.generate();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccountTransactionResponse = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    console.log('The new account ID is: ' + newAccountId);

    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(
        'The new account balance is: ' +
            accountBalance.hbars.toTinybars() +
            ' tinybar.'
    );

    const transferTransactionResponse = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
        .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
        .execute(client);

    const transactionReceipt = await transferTransactionResponse.getReceipt(
        client
    );
    console.log(
        'The transfer transaction from my account to the new account was: ' +
            transactionReceipt.status.toString()
    );

    const getBalanceCost = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .getCost(client);

    console.log('The cost of query is: ' + getBalanceCost);

    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(
        'The account balance after the transfer is: ' +
            getNewBalance.hbars.toTinybars() +
            ' tinybar.'
    );
}
main();
