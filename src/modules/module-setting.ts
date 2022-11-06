import { ModuleSettingType } from "./module-setting-type";

/**
 * Structure of a module setting
 */
export type ModuleSettingData = {
    name: string,
    value: string,
    type: ModuleSettingType
}

/**
 * represent a setting of a module
 */
export class ModuleSetting
{
    //Name of the setting
    private _name: string;
    public get name(): string { return this._name; }
    
    //Value of the setting
    private _value: string;
    
    //Type of the setting
    private _type: ModuleSettingType;
    public get type(): ModuleSettingType { return this._type; }
    
    /**
     * Constructor
     * @param name Name of the setting 
     * @param value Value of the setting
     * @param type Type of the setting
     */
    private constructor(name: string, value: string, type: ModuleSettingType)
    {
        this._name = name;
        this._value = value;
        this._type = type;
    }

    /**
     * Create a ModuleSetting instance from ModuleSettingData object
     * @param data 
     * @returns 
     */
    static fromData(data: ModuleSettingData)
    {
        return new ModuleSetting(data.name, data.value, data.type);
    }

    /**
     * Export setting data to ModuleSettingData object
     * @returns 
     */
    toData(): ModuleSettingData
    {
        return {
            name: this._name,
            value: this._value,
            type: this._type
        };
    }

    /**
     * Returns the value of the setting as a boolean
     * @returns {boolean}
     */
    asBoolean(): boolean
    {
        return this._value === "true";
    }

    /**
     * Returns the value of the setting as a string
     * @returns {string}
     */
    asText(): string
    {
        return this._value;
    }

    /**
     * Returns the value of the setting as a number
     * @returns {number}
     */
    asNumber(): number
    {
        return parseInt(this._value);
    }

    /**
     * Returns the value of the setting as a string array
     * @returns {string[]}
     */
    asTags(): string[]
    {
        return this._value.split(",");
    }

    /**
     * Creates an instance of a text setting
     * @param {string} name Name of the setting
     * @param {string}value Value of the setting
     * @returns {ModuleSetting}
     */
    static textSetting(name: string, value: string)
    {
        return new ModuleSetting(name, value, ModuleSettingType.TEXT);
    }

    /**
     * Creates an instance of a link setting
     * @param {string} name Name of the setting
     * @param {string} value Value of the setting
     * @returns {ModuleSetting}
     */
    static linkSetting(name: string, value: string)
    {
        return new ModuleSetting(name, value, ModuleSettingType.LINK);
    }

    /**
     * Creates an instance of a boolean setting
     * @param {string} name Name of the setting
     * @param {boolean} value Value of the setting
     * @returns {ModuleSetting}
     */
    static booleanSetting(name: string, value: boolean)
    {
        return new ModuleSetting(name, value ? "true" : "false", ModuleSettingType.BOOLEAN);
    }

    /**
     * Creates an instance of a tags setting
     * @param {string} name Name of the setting
     * @param {string[]} value Value of the setting
     * @returns {ModuleSetting}
     */
    static tagsSetting(name: string, value: string[])
    {
        return new ModuleSetting(name, value.join(','), ModuleSettingType.TAGS)
    }
}