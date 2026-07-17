"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSource = void 0;
var TransactionSource;
(function (TransactionSource) {
    TransactionSource["MANUAL"] = "MANUAL";
    TransactionSource["STRIPE"] = "STRIPE";
    TransactionSource["PAYPAL"] = "PAYPAL";
    TransactionSource["SQUARE"] = "SQUARE";
    TransactionSource["ZELLE"] = "ZELLE";
    TransactionSource["ACH"] = "ACH";
    TransactionSource["CHECK"] = "CHECK";
    TransactionSource["CASH"] = "CASH";
    TransactionSource["OTHER"] = "OTHER";
})(TransactionSource || (exports.TransactionSource = TransactionSource = {}));
