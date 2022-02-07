// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, ContextDefinitions, SuperAppDefinitions } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import { SuperAppBase } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

contract flowLogic is SuperAppBase{
    ISuperfluid private _host; //host, get address from Superfluid Docs
    IConstantFlowAgreementV1 private _cfa; //CFAv1, get address from Superfluid Docs
    ISuperToken private _acceptedToken; // Will have to pick a stablex from Superfluid Docs

    constructor(ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken) {
                    
            _host = host;
            _cfa = cfa;
            _acceptedToken = acceptedToken;

            uint256 configWord =
                SuperAppDefinitions.APP_LEVEL_FINAL |
                SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
                SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
                SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

            _host.registerApp(configWord);
    }

    function createFlow(address receiver, int96 flowRate) internal {
        _host.callAgreement(_cfa, abi.encodeWithSelector(_cfa.createFlow.selector, _acceptedToken, receiver, flowRate, new bytes(0)), "0x");
    }

    function deleteFlow(address receiver) internal {
        _host.callAgreement(_cfa, abi.encodeWithSelector(_cfa.deleteFlow.selector, _acceptedToken, address(this), receiver, new bytes(0)), "0x");
    }

    function updateFlow(address receiver, int96 newFlow) internal {
        _host.callAgreement(_cfa, abi.encodeWithSelector(_cfa.updateFlow.selector, _acceptedToken, receiver, newFlow, new bytes(0)), "0x");
    }

}