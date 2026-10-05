class CompatibilityValidator:

    def validate(
        self,
        specifications: list[dict]
    ) -> list[dict]:

        issues = []

        by_type = {
            item.get("component_type"): item
            for item in specifications
            if item.get("component_type")
        }

        cpu = by_type.get("Processor")
        motherboard = by_type.get("Motherboard")
        ram = by_type.get("RAM")
        gpu = by_type.get("GPU")
        psu = by_type.get("PSU")
        case = by_type.get("Case")
        cooler = by_type.get("CPU Cooler")

        # ============================================================
        # CPU ↔ MOTHERBOARD SOCKET
        # ============================================================

        if cpu and motherboard:

            cpu_socket = self._normalize(
                cpu.get("socket")
            )

            motherboard_socket = self._normalize(
                motherboard.get("socket")
            )

            if not cpu_socket or not motherboard_socket:

                issues.append({
                    "rule": "CPU_MOTHERBOARD_SOCKET",
                    "severity": "WARNING",
                    "message":
                        "CPU or motherboard socket information "
                        "is unavailable, so socket compatibility "
                        "could not be fully verified."
                })

            elif cpu_socket != motherboard_socket:

                issues.append({
                    "rule": "CPU_MOTHERBOARD_SOCKET",
                    "severity": "ERROR",
                    "message":
                        f"CPU socket {cpu.get('socket')} does not "
                        f"match motherboard socket "
                        f"{motherboard.get('socket')}."
                })

        # ============================================================
        # RAM ↔ MOTHERBOARD MEMORY TYPE
        # ============================================================

        if ram and motherboard:

            ram_type = self._normalize(
                ram.get("memory_type")
            )

            motherboard_ram_type = self._normalize(
                motherboard.get("memory_type")
            )

            if not ram_type or not motherboard_ram_type:

                issues.append({
                    "rule": "RAM_MEMORY_TYPE",
                    "severity": "WARNING",
                    "message":
                        "RAM or motherboard memory type is "
                        "unavailable, so memory compatibility "
                        "could not be fully verified."
                })

            elif ram_type != motherboard_ram_type:

                issues.append({
                    "rule": "RAM_MEMORY_TYPE",
                    "severity": "ERROR",
                    "message":
                        f"RAM type {ram.get('memory_type')} does not "
                        f"match motherboard memory type "
                        f"{motherboard.get('memory_type')}."
                })

            # ========================================================
            # RAM CAPACITY
            # ========================================================

            ram_capacity = self._number(
                ram.get("capacity_gb")
            )

            max_ram = self._number(
                motherboard.get("max_ram_gb")
            )

            if ram_capacity is not None and max_ram is not None:

                if ram_capacity > max_ram:

                    issues.append({
                        "rule": "RAM_CAPACITY",
                        "severity": "ERROR",
                        "message":
                            f"RAM capacity {ram_capacity}GB exceeds "
                            f"motherboard maximum of {max_ram}GB."
                    })

            elif ram_capacity is None or max_ram is None:

                issues.append({
                    "rule": "RAM_CAPACITY",
                    "severity": "WARNING",
                    "message":
                        "RAM capacity or motherboard maximum "
                        "RAM information is unavailable."
                })

        # ============================================================
        # CPU ↔ CPU COOLER SOCKET
        # ============================================================

        if cpu and cooler:

            cpu_socket = self._normalize(
                cpu.get("socket")
            )

            supported_sockets = self._normalize_list(
                cooler.get("supported_sockets")
            )

            if not cpu_socket or not supported_sockets:

                issues.append({
                    "rule": "CPU_COOLER_SOCKET",
                    "severity": "WARNING",
                    "message":
                        "CPU socket or CPU cooler supported socket "
                        "information is unavailable."
                })

            elif not self._socket_supported(
                cpu_socket,
                supported_sockets
            ):

                issues.append({
                    "rule": "CPU_COOLER_SOCKET",
                    "severity": "ERROR",
                    "message":
                        f"CPU socket {cpu.get('socket')} is not "
                        f"supported by the CPU cooler."
                })

        # ============================================================
        # MOTHERBOARD ↔ CASE FORM FACTOR
        # ============================================================

        if motherboard and case:

            motherboard_form_factor = self._normalize(
                motherboard.get("form_factor")
            )

            case_form_factor = self._normalize(
                case.get("case_form_factor")
            )

            if not motherboard_form_factor or not case_form_factor:

                issues.append({
                    "rule": "MOTHERBOARD_CASE_FORM_FACTOR",
                    "severity": "WARNING",
                    "message":
                        "Motherboard or case form factor information "
                        "is unavailable."
                })

            elif not self._form_factor_supported(
                motherboard_form_factor,
                case_form_factor
            ):

                issues.append({
                    "rule": "MOTHERBOARD_CASE_FORM_FACTOR",
                    "severity": "ERROR",
                    "message":
                        f"Motherboard form factor "
                        f"{motherboard.get('form_factor')} is not "
                        f"supported by the case "
                        f"{case.get('case_form_factor')}."
                })

        # ============================================================
        # GPU ↔ CASE LENGTH
        # ============================================================

        if gpu and case:

            gpu_length = self._number(
                gpu.get("gpu_length_mm")
            )

            max_gpu_length = self._number(
                case.get("max_gpu_length_mm")
            )

            if (
                gpu_length is None
                or max_gpu_length is None
            ):

                issues.append({
                    "rule": "GPU_CASE_LENGTH",
                    "severity": "WARNING",
                    "message":
                        "GPU length or case maximum GPU length "
                        "information is unavailable."
                })

            elif gpu_length > max_gpu_length:

                issues.append({
                    "rule": "GPU_CASE_LENGTH",
                    "severity": "ERROR",
                    "message":
                        f"GPU length {gpu_length}mm exceeds case "
                        f"maximum GPU length of "
                        f"{max_gpu_length}mm."
                })

        # ============================================================
        # CPU COOLER ↔ CASE HEIGHT
        # ============================================================

        if cooler and case:

            cooler_height = self._number(
                cooler.get("cooler_height_mm")
            )

            max_cooler_height = self._number(
                case.get("max_cpu_cooler_height_mm")
            )

            if (
                cooler_height is None
                or max_cooler_height is None
            ):

                issues.append({
                    "rule": "CPU_COOLER_CASE_HEIGHT",
                    "severity": "WARNING",
                    "message":
                        "CPU cooler height or case maximum cooler "
                        "height information is unavailable."
                })

            elif cooler_height > max_cooler_height:

                issues.append({
                    "rule": "CPU_COOLER_CASE_HEIGHT",
                    "severity": "ERROR",
                    "message":
                        f"CPU cooler height {cooler_height}mm exceeds "
                        f"case maximum CPU cooler height of "
                        f"{max_cooler_height}mm."
                })

        # ============================================================
        # PSU ↔ GPU CONNECTORS
        # ============================================================

        if psu and gpu:

            gpu_connectors = self._normalize_list(
                gpu.get("power_connectors")
            )

            psu_connectors = self._normalize_list(
                psu.get("pcie_connectors")
            )

            if not gpu_connectors or not psu_connectors:

                issues.append({
                    "rule": "PSU_GPU_CONNECTORS",
                    "severity": "WARNING",
                    "message":
                        "GPU or PSU power connector information "
                        "is unavailable."
                })

            else:

                for required_connector in gpu_connectors:

                    if not self._connector_supported(
                        required_connector,
                        psu_connectors
                    ):

                        issues.append({
                            "rule": "PSU_GPU_CONNECTORS",
                            "severity": "ERROR",
                            "message":
                                f"GPU requires "
                                f"{required_connector}, but the PSU "
                                f"does not appear to provide a "
                                f"compatible connector."
                        })

        # ============================================================
        # PSU WATTAGE
        # ============================================================

        if psu:

            psu_wattage = self._number(
                psu.get("psu_wattage")
            )

            if psu_wattage is None:

                issues.append({
                    "rule": "PSU_WATTAGE",
                    "severity": "WARNING",
                    "message":
                        "PSU wattage information is unavailable."
                })

            else:

                cpu_power = self._number(
                    cpu.get("tdp_w")
                ) if cpu else 0

                gpu_power = self._number(
                    gpu.get("power_consumption_w")
                ) if gpu else 0

                cpu_power = cpu_power or 0
                gpu_power = gpu_power or 0

                estimated_power = (
                    cpu_power +
                    gpu_power
                )

                if estimated_power > 0:

                    recommended_power = (
                        estimated_power * 1.30
                    )

                    if psu_wattage < recommended_power:

                        issues.append({
                            "rule": "PSU_WATTAGE",
                            "severity": "ERROR",
                            "message":
                                f"PSU wattage {psu_wattage}W is "
                                f"below the estimated requirement "
                                f"of approximately "
                                f"{recommended_power:.0f}W."
                        })

                else:

                    issues.append({
                        "rule": "PSU_WATTAGE",
                        "severity": "WARNING",
                        "message":
                            "CPU/GPU power information is unavailable, "
                            "so PSU capacity could not be fully verified."
                    })

        return issues

    # ================================================================
    # HELPERS
    # ================================================================

    @staticmethod
    def _normalize(value):

        if value is None:
            return None

        value = str(value).strip().lower()

        value = value.replace(
            " ",
            ""
        )

        return value

    @staticmethod
    def _number(value):

        if value is None:
            return None

        if isinstance(value, bool):
            return None

        if isinstance(value, (int, float)):
            return float(value)

        text = str(value).strip()

        match = re.search(
            r"\d+(?:\.\d+)?",
            text
        )

        if not match:
            return None

        try:
            return float(match.group())
        except ValueError:
            return None

    @classmethod
    def _normalize_list(cls, value):

        if value is None:
            return []

        if isinstance(value, str):
            value = [
                item.strip()
                for item in value.split(",")
                if item.strip()
            ]

        if not isinstance(value, list):
            return []

        return [
            cls._normalize(item)
            for item in value
            if item is not None
        ]

    @staticmethod
    def _socket_supported(
        cpu_socket,
        supported_sockets
    ):

        for socket in supported_sockets:

            if cpu_socket == socket:
                return True

        return False

    @staticmethod
    def _form_factor_supported(
        motherboard_form_factor,
        case_form_factor
    ):

        # Exact match
        if motherboard_form_factor == case_form_factor:
            return True

        # Case specifications often look like:
        # "ATX, Micro-ATX, Mini-ITX"
        supported = re.split(
            r"[,/|]+",
            case_form_factor
        )

        supported = [
            item.strip()
            for item in supported
        ]

        return motherboard_form_factor in supported

    @staticmethod
    def _connector_supported(
        required,
        available
    ):

        required = required.lower().replace(
            " ",
            ""
        )

        for connector in available:

            connector = connector.lower().replace(
                " ",
                ""
            )

            # Direct match
            if required == connector:
                return True

            # Handle common variations:
            # 8pin
            # 1x8pin
            # 1x8-pin
            required_clean = required.replace(
                "-",
                ""
            )

            connector_clean = connector.replace(
                "-",
                ""
            )

            if required_clean == connector_clean:
                return True

            if required_clean in connector_clean:
                return True

        return False