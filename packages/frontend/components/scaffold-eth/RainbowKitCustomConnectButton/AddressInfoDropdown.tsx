import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address, useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CogIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  // Check if user is contract owner or admin
  const { data: contractOwner } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "owner",
  });

  const { data: isAdmin } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "isAdmin",
    args: [address],
    enabled: !!address,
  });

  const isContractOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
  const isAuthorized = isContractOwner || isAdmin;

  return (
    <>
      <details ref={dropdownRef} className="relative leading-3">
        <summary
          tabIndex={0}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-card border border-card-border hover:bg-accent hover:text-accent-foreground h-10 px-3 cursor-pointer list-none"
        >
          <div className="hidden lg:flex w-5">
            <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          </div>
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-4 w-4 ml-2 sm:ml-0" />
        </summary>
        <ul
          tabIndex={0}
          className="absolute right-0 z-50 min-w-[200px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md mt-2"
        >
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                <CheckCircleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              <CopyToClipboard
                text={checkSumAddress}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span className="whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label
              htmlFor="qrcode-modal"
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              type="button"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              type="button"
              onClick={() => {
                closeDropdown();
                router.push("/investor");
              }}
            >
              <BanknotesIcon className="h-4 w-4 mr-2" /> <span>My Investment</span>
            </button>
          </li>
          {isAuthorized && (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
                onClick={() => {
                  closeDropdown();
                  router.push("/owner");
                }}
              >
                <CogIcon className="h-4 w-4 mr-2" /> <span>Manage Projects</span>
              </button>
            </li>
          )}
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-4 w-4 mr-2" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-destructive"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
